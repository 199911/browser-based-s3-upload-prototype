/**
 * Reference: https://reactjs.org/docs/uncontrolled-components.html#the-file-input-tag
 */

import Promise from 'bluebird';
import _ from 'lodash';
import React, { Component } from 'react';
import './LargeFileInput.css';

import ProgressMessages from './ProgressMessages.js';

// Set size of each chunk to 32 MB
const sliceSize = 32 * 1024 * 1024;

class LargeFileInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: [],
      uploadedUri: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  updateProgress(parts) {
    const progress = parts.map(
      ({ status, message }) => ({ status, message })
    );
    this.setState({ progress });
  }

  async handleSubmit(event) {
    event.preventDefault();

    const largeFile = this.fileInput.current.files[0];
    const size = largeFile.size;

    // Chunk the largeFile
    const parts = [];
    let start = 0;
    let end = sliceSize;
    let sequence = 1;
    while(start < size) {
      parts.push({
        file: largeFile.slice(start, end),
        sequence,
        status: 'Pending',
      });
      start = end;
      end += sliceSize;
      sequence += 1;
    }


    const timerId = setInterval(
      () => { this.updateProgress(parts); },
      1000,
    );

    // Init upload process
    const response = await fetch(
      '/uploads',
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    )
      // parses response to JSON
      .then(response => response.json());

    console.log(response);
    const { UploadId: uploadId } = response;

    let incompletedParts = parts;
    let isCompleted = false;
    while (!isCompleted) {
      // Upload at most 3 parts parallelly
      const promises = _
        .chain(incompletedParts)
        .slice(0, 3)
        .map(async (part) => {
          // Get signed upload part url
          const partNum = part.sequence;
          part.status = 'Uploading';
          part.message = false;
          let url;
          try {
            const response = await fetch(
              `/uploads/${uploadId}/parts/${partNum}`,
              {
                method: "POST",
                mode: "cors",
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                },
              }
            )
              // parses response to JSON
              .then(response => response.json());
            url = response.url;
          } catch (e) {
            return {
              sequence: partNum,
              message: "Fail to get signed URL",
            }
          }

          // Upload part
          try {
            const result = await fetch(url, {
              // signed put-object url must be triggered by PUT method
              method: 'PUT',
              body: part.file,
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });

            if (!result.ok) {
              console.log(`Failure: part ${partNum}`);
            }
            part.status = result.ok ? 'Done' : 'Error';
          } catch (e) {
            return {
              sequence: partNum,
              message: "Fail to upload parts",
            };
          }
          // Does not return anything when success
        });

      const results = await Promise.all(promises);
      const failures = _.compact(results);
      if (failures.length > 0) {
        console.log(`Some parts fail to uplaod`);
        failures.forEach(({sequence, message}) => {
          console.log({sequence, message});
          const part = _.find(parts, (p) => p.sequence === sequence);
          console.log(part);
          if (part) {
            part.status = 'Error';
            part.message = message;
          }
        })
        await Promise.delay(5000);
      }
      console.log(failures);

      incompletedParts = _.filter(parts, p => p.status !== 'Done');
      isCompleted = incompletedParts.length === 0;
      console.log(incompletedParts);
    }

    clearInterval(timerId);
    this.updateProgress(parts);

    // Complete multipart upload
    const { Location } = await fetch(
      `/uploads/${uploadId}`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    )
      // parses response to JSON
      .then(response => response.json());
    this.setState({ uploadedUri: Location });
  }

  render() {
    const { progress, uploadedUri } = this.state;
    return (
      <form className="LargeFileInput" onSubmit={this.handleSubmit}>
        {
          uploadedUri && <div><a href={uploadedUri}>Download Uploaded File</a></div>
        }
        <div>
          <label>
            Upload Large file:
          </label>
          <input type="file" ref={this.fileInput} />
        </div>
        <div>
          <input type="submit" value="Submit" />
        </div>
        <ProgressMessages progress={progress} />
      </form>
    );
  }
}

export default LargeFileInput;
