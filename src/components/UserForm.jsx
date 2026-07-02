import { useEffect, useState } from 'react';

const emptyDetails = {
  firstName: '',
  lastName: '',
  email: '',
  department: '',
};

export default function UserForm({
  onAdd,
  onEditSubmit,
  initialUser,
  onCancelEdit,
}) {
  const [details, setDetails] = useState(emptyDetails);
  const isEditing = Boolean(initialUser);

  useEffect(() => {
    if (!initialUser) {
      setDetails(emptyDetails);
      return;
    }
    setDetails({
      firstName: initialUser.firstName,
      lastName: initialUser.lastName,
      email: initialUser.email,
      department: initialUser.department,
    });
  }, [initialUser]);

  function formHandler(e) {
    e.preventDefault();
    if (isEditing) {
      onEditSubmit(details);
    } else {
      onAdd(details);
    }
    setDetails(emptyDetails);
  }

  function handleCancel() {
    setDetails(emptyDetails);
    onCancelEdit?.();
  }

  return (
    <div className="form-card w-full max-w-lg mx-auto mt-4 p-4 sm:p-6">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        {isEditing ? 'Edit User' : 'Add New User'}
      </h2>
      <form
        onSubmit={formHandler}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <label htmlFor="firstName" className="flex flex-col text-sm">
          First Name:
          <input
            name="firstName"
            value={details.firstName}
            required={true}
            onChange={(e) =>
              setDetails((prev) => ({ ...prev, firstName: e.target.value }))
            }
            className="mt-1 rounded border border-gray-300 px-2 py-1.5"
          ></input>
        </label>
        <label htmlFor="lastName" className="flex flex-col text-sm">
          Last Name:
          <input
            name="lastName"
            value={details.lastName}
            required={true}
            onChange={(e) =>
              setDetails((prev) => ({ ...prev, lastName: e.target.value }))
            }
            className="mt-1 rounded border border-gray-300 px-2 py-1.5"
          ></input>
        </label>
        <label htmlFor="email" className="flex flex-col text-sm">
          Email:
          <input
            name="email"
            value={details.email}
            required={true}
            onChange={(e) =>
              setDetails((prev) => ({ ...prev, email: e.target.value }))
            }
            className="mt-1 rounded border border-gray-300 px-2 py-1.5"
          ></input>
        </label>
        <label htmlFor="department" className="flex flex-col text-sm">
          Department:
          <input
            name="department"
            value={details.department}
            onChange={(e) =>
              setDetails((prev) => ({ ...prev, department: e.target.value }))
            }
            className="mt-1 rounded border border-gray-300 px-2 py-1.5"
          ></input>
        </label>
        <div className="sm:col-span-2 flex justify-center gap-2 mt-2">
          <button className="btn-primary px-4 py-2" type="submit">
            {isEditing ? 'Save Changes' : 'Add User'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
