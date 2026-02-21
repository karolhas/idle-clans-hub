export const formatUpgradeName = (name: string): string => {
  const nameToFormat = name.startsWith("upgrade_")
    ? name.slice("upgrade_".length)
    : name;
  return nameToFormat
    .split(/(?=[A-Z])|[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
