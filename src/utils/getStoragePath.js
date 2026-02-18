export const getStoragePath = async (file) => {
  if (!file?.path) return null;

  const normalizedPath = file.path.replace(/\\/g, "/");
  const index = normalizedPath.indexOf("storage/");

  return index !== -1 ? normalizedPath.substring(index) : null;
};
