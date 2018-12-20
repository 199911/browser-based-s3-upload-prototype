import React, { Component } from 'react';

class ProgressMessages extends Component {

  render() {
    const { progress } = this.props;
    const total = progress.length;
    const done = progress.filter(p => p.isUploaded).length;
    return (
      <>
        <h2>
          { `Upload progress ${done}/${total}` }
        </h2>
        {
          progress.map((part, index) => {
            return (
              <p key={ `${index + 1}` }>
                { `Part #${index + 1}: ${part.isUploaded ? 'done' : 'waiting'}` }
                <br/>
                <small style={{ color: 'red' }}>
                  { part.message }
                </small>
              </p>
            );
          })
        }
      </>
    );
  }
}

export default ProgressMessages;
