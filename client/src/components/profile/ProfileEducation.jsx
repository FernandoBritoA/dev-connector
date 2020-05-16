import React from 'react';
import Moment from 'react-moment';
import moment from 'moment';

const ProfileEducation = ({
  education: { school, degree, fieldofstudy, todate, fromdate, description },
}) => (
  <div>
    <h3 className='text-dark'>{school}</h3>
    <p>
      <Moment format='YYYY/MM/DD'>{moment.utc(fromdate)}</Moment> -{' '}
      {!todate ? (
        ' Now'
      ) : (
        <Moment format='YYYY/MM/DD'>{moment.utc(todate)}</Moment>
      )}
    </p>
    <p>
      <strong>Degree: </strong> {degree}
    </p>
    <p>
      <strong>Field Of Study: </strong> {fieldofstudy}
    </p>
    <p>
      <strong>Description: </strong> {description}
    </p>
  </div>
);

export default ProfileEducation;
