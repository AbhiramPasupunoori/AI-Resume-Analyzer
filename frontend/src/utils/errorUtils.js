function findFirstError(value, path = []) {
  if (typeof value === "string" && value.trim()) {
    return {
      message: value,
      path,
    };
  }

  if (Array.isArray(value)) {
    const containsNestedValues = value.some(
      (item) => item && typeof item === "object"
    );

    for (const [index, item] of value.entries()) {
      const itemPath = containsNestedValues ? [...path, String(index)] : path;
      const error = findFirstError(item, itemPath);

      if (error) {
        return error;
      }
    }

    return null;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      const error = findFirstError(item, [...path, key]);

      if (error) {
        return error;
      }
    }
  }

  return null;
}

function formatErrorPath(path) {
  const visiblePath = path.filter(
    (part) => part !== "detail" && part !== "non_field_errors"
  );

  if (visiblePath.length === 0) {
    return "";
  }

  const label = visiblePath
    .map((part) => {
      if (/^\d+$/.test(part)) {
        return String(Number(part) + 1);
      }

      return part.replace(/_id$/, "").replaceAll("_", " ");
    })
    .join(" ");

  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

export function getErrorMessage(error) {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  if (!error.response) {
    return "Could not connect to the backend. Please check if Django is running.";
  }

  const data = error.response.data;

  const firstError = findFirstError(data);

  if (firstError) {
    const fieldLabel = formatErrorPath(firstError.path);

    return fieldLabel
      ? `${fieldLabel}: ${firstError.message}`
      : firstError.message;
  }

  return "Something went wrong. Please check your input and try again.";
}
