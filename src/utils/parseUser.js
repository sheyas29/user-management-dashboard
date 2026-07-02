// This function splits a full name into first and last name
// It assumes the first word is the first name and the rest is the last name
export function splitName(name) {
  const titles = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.']; //using only these titles to remove from the name if present as we are well aware of the data
  const nameParts = name.trim().split(/\s+/);
  if (titles.includes(nameParts[0])) {
    nameParts.shift();
  }
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  return { firstName, lastName };
}

// This function maps the single API user object to the desired user format
export function mapApiUserToUser(apiUser) {
  const { firstName, lastName } = splitName(apiUser.name); //using splitName to split the full name into first and last name
  return {
    id: apiUser.id,
    firstName,
    lastName,
    email: apiUser.email || '',
    department: apiUser.company?.name || '', //assuming company.name is the departmnet
  };
}
