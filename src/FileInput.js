/**
 * Reference: https://reactjs.org/docs/uncontrolled-components.html#the-file-input-tag
 */

import React, { Component } from 'react';
import './FileInput.css';

class FileInput extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  async handleSubmit(event) {
    event.preventDefault();

    // Get signed url
    const response = await fetch(
      '//localhost:3001/put-object-urls',
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

    const { url } = response;
    console.log(url);

    // Send request
    const file = this.fileInput.current.files[0];
    const result = await fetch(url, {
      // signed put-object url must be triggered by PUT method
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (result.ok) {
      console.log('Success');
    } else {
      console.log('Failure');
    }
  }

  render() {
    return (
      <form className="FileInput" onSubmit={this.handleSubmit}>
        <div>
          <label>
            Upload file:
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

export default FileInput;
