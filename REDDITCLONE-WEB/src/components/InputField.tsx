import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name: string;
    label: string;
}; 

// i want my input field component to take any props that a regular input field will take
export const InputField: React.FC<InputFieldProps> = ({ label, size: _, ...props}) => {
    const [field, {error}] = useField(props);
        return(
            // cast string to boolean by doing !!
            <FormControl isInvalid={!!error}>
              <FormLabel htmlFor={field.name}>{label}</FormLabel>
              <Input
              {...field}
              {...props}
                id={field.name}
                // value={values.username}
                // onChange={handleChange}
                placeholder={props.placeholder}
              />
              {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
            </FormControl>
        );
}