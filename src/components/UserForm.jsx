import { useState } from 'react';

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

// Letters, spaces, hyphens, and apostrophes only — covers names like
// "Mary-Jane" or "O'Brien" while rejecting digits/symbols.
const NAME_REGEX = /^[A-Za-z][A-Za-z '-]*$/;
const MAX_NAME_LENGTH = 50;

// Requires a real local part, a domain with at least one dot, and a
// TLD of 2+ letters — tighter than a bare "has an @ and a dot" check.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const MAX_EMAIL_LENGTH = 254; // RFC 5321 limit

export default function UserForm({
  onAdd,
  onEditSubmit,
  initialUser,
  onCancelEdit,
  existingEmails = [],
}) {
  const [details, setDetails] = useState(
    initialUser
      ? {
          firstName: initialUser.firstName,
          lastName: initialUser.lastName,
          email: initialUser.email,
          department: initialUser.department,
        }
      : emptyDetails
  );
  const [errors, setErrors] = useState(emptyErrors);
  const isEditing = Boolean(initialUser);

  // Department is intentionally excluded — it's optional per the spec.
  function validate(values) {
    const nextErrors = { ...emptyErrors };
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = values.email.trim();

    if (!firstName) {
      nextErrors.firstName = 'First name is required';
    } else if (firstName.length > MAX_NAME_LENGTH) {
      nextErrors.firstName = `First name must be ${MAX_NAME_LENGTH} characters or fewer`;
    } else if (!NAME_REGEX.test(firstName)) {
      nextErrors.firstName =
        'First name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (!lastName) {
      nextErrors.lastName = 'Last name is required';
    } else if (lastName.length > MAX_NAME_LENGTH) {
      nextErrors.lastName = `Last name must be ${MAX_NAME_LENGTH} characters or fewer`;
    } else if (!NAME_REGEX.test(lastName)) {
      nextErrors.lastName =
        'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (!email) {
      nextErrors.email = 'Email is required';
    } else if (email.length > MAX_EMAIL_LENGTH) {
      nextErrors.email = 'Email is too long';
    } else if (!EMAIL_REGEX.test(email)) {
      nextErrors.email = 'Enter a valid email address, e.g. name@example.com';
    } else if (existingEmails.includes(email.toLowerCase())) {
      nextErrors.email = 'A user with this email already exists';
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

  const inputClass =
    'mt-1 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

  return (
    <div className="form-card w-full bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit User' : 'Add New User'}
      </h2>
      <form
        onSubmit={formHandler}
        className="grid grid-cols-1 gap-y-4"
        noValidate
      >
        <label
          htmlFor="firstName"
          className="flex flex-col text-sm text-gray-600"
        >
          First Name
          <input
            id="firstName"
            name="firstName"
            value={details.firstName}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            className={inputClass}
          />
          {errors.firstName && (
            <span className="text-red-600 text-xs mt-1">
              {errors.firstName}
            </span>
          )}
        </label>

        <label
          htmlFor="lastName"
          className="flex flex-col text-sm text-gray-600"
        >
          Last Name
          <input
            id="lastName"
            name="lastName"
            value={details.lastName}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            className={inputClass}
          />
          {errors.lastName && (
            <span className="text-red-600 text-xs mt-1">{errors.lastName}</span>
          )}
        </label>

        <label htmlFor="email" className="flex flex-col text-sm text-gray-600">
          Email
          <input
            id="email"
            name="email"
            type="email"
            value={details.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className={inputClass}
          />
          {errors.email && (
            <span className="text-red-600 text-xs mt-1">{errors.email}</span>
          )}
        </label>

        <label
          htmlFor="department"
          className="flex flex-col text-sm text-gray-600"
        >
          Department <span className="text-gray-400">(optional)</span>
          <input
            id="department"
            name="department"
            value={details.department}
            onChange={(e) => handleFieldChange('department', e.target.value)}
            className={inputClass}
          />
        </label>

        <div className="flex justify-end gap-2 mt-2">
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            className="btn-primary rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            type="submit"
          >
            {isEditing ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
}
