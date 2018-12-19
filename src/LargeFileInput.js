/**
 * Reference: https://reactjs.org/docs/uncontrolled-components.html#the-file-input-tag
 */

import React, { Component } from 'react';
import './LargeFileInput.css';

// Set size of each chunk to 64 MB
const sliceSize = 64 * 1024 * 1024;

class LargeFileInput extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  async handleSubmit(event) {
    event.preventDefault();

    const largeFile = this.fileInput.current.files[0];
    const size = largeFile.size;

    // Chunk the largeFile
    const parts = [];
    let start = 0;
    let end = sliceSize;
    while(start < size) {
      parts.push({
        file: largeFile.slice(start, end),
        isUploaded: false,
      });
      start = end;
      end += sliceSize;
    }

    console.log(parts);

    // Init upload process
    const response = await fetch(
      '//localhost:3001/uploads',
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

    // TODO: Re-try logic
    // TODO: Limit the number of parallel upload, avoid timeout problem
    const promises = parts.map(async (part, index) => {
      // Get signed upload part url
      const partNum = index + 1;
      const { url } = await fetch(
        `//localhost:3001/uploads/${uploadId}/parts/${partNum}`,
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

      // Upload part
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
      part.isUploaded = result.ok;
    });

    const timerId = setInterval(
      () => { console.log(parts); },
      3000,
    );

    await Promise.all(promises);

    clearInterval(timerId);

    // Complete multipart upload
    await fetch(
      `//localhost:3001/uploads/${uploadId}`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }

  render() {
    return (
      <form className="LargeFileInput" onSubmit={this.handleSubmit}>
        <div>
          <label>
            Upload Large file:
          </label>
          <input type="file" ref={this.fileInput} />
        </div>
        <div>
          <input type="submit" value="Submit" />
        </div>
      </form>
    );
  }
}

export default LargeFileInput;
