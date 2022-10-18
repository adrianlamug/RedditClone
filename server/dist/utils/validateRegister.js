"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validateRegister = (options) => {
    if (!options.email.includes("@")) {
        return [{
                field: "email",
                message: "invalid email"
            }];
    }
    if (options.username.includes("@")) {
        return [{
                field: "username",
                message: "can't include @ in username"
            }];
    }
    if (options.username.length <= 2) {
        return [{
                field: "username",
                message: "length must be greater than 2"
            }];
    }
    if (options.password.length <= 4) {
        return [{
                field: "password",
                message: "length must be greater than 4"
            }];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map