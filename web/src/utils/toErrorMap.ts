import { FieldError } from "../generated/graphql";


// parameter errors of type FieldError[]
// errors : [{field: 'username', message: 'username already taken', __typename: FieldError}]
export const toErrorMap = (errors: FieldError[]) => {
    const errorMap: Record<string,string> = {};
    errors.forEach(({field, message})=> {
        // example output
        // 'username' = 'username already taken'
        errorMap[field] = message
    });
    return errorMap;
}