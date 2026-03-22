export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('lms_token');

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};
