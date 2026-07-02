import { useEffect, useState } from 'react';

const emptyDetails = {
  firstName: '',
  lastName: '',
  email: '',
  department: '',
};

const emptyErrors = {
  firstName: '',
  lastName: '',
  email: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserForm({
  onAdd,
  onEditSubmit,
  initialUser,
  onCancelEdit,
}) {
  const [details, setDetails] = useState(emptyDetails);
  const [errors, setErrors] = useState(emptyErrors);
  const isEditing = Boolean(initialUser);

  useEffect(() => {
    if (!initialUser) {
      setDetails(emptyDetails);
      setErrors(emptyErrors);
      return;
    }
    setDetails({
      firstName: initialUser.firstName,
      lastName: initialUser.lastName,
      email: initialUser.email,
      department: initialUser.department,
    });
    setErrors(emptyErrors);
  }, [initialUser]);

  // Department is intentionally excluded — it's optional per the spec.
  function validate(values) {
    const nextErrors = { ...emptyErrors };

    if (!values.firstName.trim()) {
      nextErrors.firstName = 'First name is required';
    }
    if (!values.lastName.trim()) {
      nextErrors.lastName = 'Last name is required';
    }
    if (!values.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address, e.g. name@example.com';
    }

    return nextErrors;
  }

  function hasErrors(nextErrors) {
    return Object.values(nextErrors).some((message) => message !== '');
  }

  function formHandler(e) {
    e.preventDefault();

    const nextErrors = validate(details);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return; // stop here — don't call onAdd/onEditSubmit with bad data

    if (isEditing) {
      onEditSubmit(details);
    } else {
      onAdd(details);
    }
    setDetails(emptyDetails);
    setErrors(emptyErrors);
  }

  function handleFieldChange(field, value) {
    setDetails((prev) => ({ ...prev, [field]: value }));
    // Clear that field's error as soon as the user starts fixing it,
    // rather than making them resubmit to find out it's valid now.
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }

  function handleCancel() {
    setDetails(emptyDetails);
    setErrors(emptyErrors);
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
        noValidate
      >
        <label htmlFor="firstName" className="flex flex-col text-sm">
          First Name:
          <input
            id="firstName"
            name="firstName"
            value={details.firstName}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            className="mt-1 rounded border border-gray-300 px-2 py-1.5"
          />
          {errors.firstName && (
            <span className="text-red-600 text-xs mt-1">
              {errors.firstName}
            </span>
          )}
        </label>

        <label htmlFor="lastName" className="flex flex-col text-sm">
          Last Name:
          <input
            id="lastName"
            name="lastName"
            value={details.lastName}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            className="mt-1 rounded border border-gray-300 px-2 py-1.5"
          />
          {errors.lastName && (
            <span className="text-red-600 text-xs mt-1">{errors.lastName}</span>
          )}
        </label>

        <label htmlFor="email" className="flex flex-col text-sm">
          Email:
          <input
            id="email"
            name="email"
            type="email"
            value={details.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className="mt-1 rounded border border-gray-300 px-2 py-1.5"
          />
          {errors.email && (
            <span className="text-red-600 text-xs mt-1">{errors.email}</span>
          )}
        </label>

        <label htmlFor="department" className="flex flex-col text-sm">
          Department <span className="text-gray-400">(optional)</span>:
          <input
            id="department"
            name="department"
            value={details.department}
            onChange={(e) => handleFieldChange('department', e.target.value)}
            className="mt-1 rounded border border-gray-300 px-2 py-1.5"
          />
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
