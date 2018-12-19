/**
 * Reference: https://reactjs.org/docs/uncontrolled-components.html#the-file-input-tag
 */

import React, { Component } from 'react';

class FileInput extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  handleSubmit(event) {
    event.preventDefault();
    // Get signed url
    fetch(
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
      .then(response => response.json())
      .then(({ url }) => {
        // Send request
        const file = this.fileInput.current.files[0];
        fetch(url, {
          // signed put-object url must be triggered by PUT method
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
          .then(res => {
            if(res.ok) {
              console.log('success');
              console.log('res is',res);
            } else {
              console.log('error');
            }
          });
      });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Upload file:
          <input type="file" ref={this.fileInput} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    );
  }
}

export default FileInput;
