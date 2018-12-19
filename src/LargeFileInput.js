/**
 * Reference: https://reactjs.org/docs/uncontrolled-components.html#the-file-input-tag
 */

import React, { Component } from 'react';
import './LargeFileInput.css';

class LargeFileInput extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  async handleSubmit(event) {
    event.preventDefault();

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
