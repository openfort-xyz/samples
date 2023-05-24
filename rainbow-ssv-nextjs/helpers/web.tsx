export const getItem = (key: string, session?: boolean): any => {
    return typeof window !== "undefined"
      ? JSON.parse((session ? sessionStorage : localStorage).getItem(key) || 'null')
      : null;
  };
  
  export const removeItem = (key: string, session: boolean): void => {
    if (typeof window !== "undefined") {
      (session ? sessionStorage : localStorage).removeItem(key);
    }
  };
  
  export const setItem = (key: string, data: any, session?: boolean): void => {
    if (typeof window !== "undefined" && data) {
      (session ? sessionStorage : localStorage).setItem(
        key,
        JSON.stringify(data)
      );
    }
  };

  export const getFormData = (params:any) => {
    const formData = new URLSearchParams();
  
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const value = params[key];
  
        if (Array.isArray(value)) {
          for (let i = 0; i < params[key].length; i++) {
            const nestedObject = params[key][i];
            for (const nestedKey in nestedObject) {
              if (nestedObject.hasOwnProperty(nestedKey)) {
                const nestedValue = nestedObject[nestedKey];
                if (Array.isArray(nestedValue)) {
                  for (let j = 0; j < nestedValue.length; j++) {
                    const arrayValue = nestedValue[j];
                    formData.append(
                      `${key}[${i}][${nestedKey}][${j}]`,
                      arrayValue
                    );
                  }
                } else if (
                  typeof nestedValue === "object" &&
                  nestedValue !== null
                ) {
                  for (const subKey in nestedValue) {
                    if (nestedValue.hasOwnProperty(subKey)) {
                      const subValue = nestedValue[subKey];
                      formData.append(
                        `${key}[${i}][${nestedKey}][${subKey}]`,
                        subValue
                      );
                    }
                  }
                } else {
                  formData.append(`${key}[${i}][${nestedKey}]`, nestedValue);
                }
              }
            }
          }
        } else if (typeof value === "object" && value !== null) {
          // if it's an object, handle it here
          const nestedObject = value;
          for (const nestedKey in nestedObject) {
            if (nestedObject.hasOwnProperty(nestedKey)) {
              const nestedValue = nestedObject[nestedKey];
              if (Array.isArray(nestedValue)) {
                for (let j = 0; j < nestedValue.length; j++) {
                  const arrayValue = nestedValue[j];
                  formData.append(`${key}[${nestedKey}][${j}]`, arrayValue);
                }
              } else if (
                typeof nestedValue === "object" &&
                nestedValue !== null
              ) {
                for (const subKey in nestedValue) {
                  if (nestedValue.hasOwnProperty(subKey)) {
                    const subValue = nestedValue[subKey];
                    formData.append(`${key}[${nestedKey}][${subKey}]`, subValue);
                  }
                }
              } else {
                formData.append(`${key}[${nestedKey}]`, nestedValue);
              }
            }
          }
        } else {
          formData.append(key, params[key]);
        }
      }
    }
    return formData;
  };
  