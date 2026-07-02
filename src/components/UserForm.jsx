import { useState } from 'react';

export default function UserForm({ onAdd }) {
  const [details, setDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
  });
  function formHandler(e) {
    e.preventDefault();
    onAdd(details);
  }
  console.log(details);
  return (
    <div className="form-card">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
        Add New User
      </h2>
      <form onSubmit={formHandler}>
        <label htmlFor="firstName">
          First Name:
          <input
            name="firstName"
            value={details.firstName}
            required={true}
            onChange={(e) =>
              setDetails((prev) => {
                return { ...prev, firstName: e.target.value };
              })
            }
          ></input>
        </label>
        <label htmlFor="lastName">
          Last Name:
          <input
            name="lastName"
            value={details.lastName}
            required={true}
            onChange={(e) =>
              setDetails((prev) => {
                return { ...prev, lastName: e.target.value };
              })
            }
          ></input>
        </label>
        <label htmlFor="email">
          Email:
          <input
            name="email"
            value={details.email}
            required={true}
            onChange={(e) =>
              setDetails((prev) => {
                return { ...prev, email: e.target.value };
              })
            }
          ></input>
        </label>
        <label htmlFor="department">
          Department:
          <input
            name="department"
            value={details.department}
            onChange={(e) =>
              setDetails((prev) => {
                return { ...prev, department: e.target.value };
              })
            }
          ></input>
        </label>
        <button className="btn-primary">Add User</button>
      </form>
    </div>
  );
}
