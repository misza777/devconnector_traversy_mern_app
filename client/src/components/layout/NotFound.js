import React, { Fragment } from "react";

const NotFound = (props) => {
  return (
    <Fragment>
      <div className="container">
        <div className="not-found">
          <h1 className="x-large text-primary">
            <i className="fas fa-exclamation-triangle"></i>Page Not Found
          </h1>
          <p className="large">Sorry, this page does not exist</p>
        </div>
      </div>
    </Fragment>
  );
};

export default NotFound;
