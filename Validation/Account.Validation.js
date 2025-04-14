const yup = require("yup");

const create_account_validater = yup.object().shape({
  name: yup.string("Name should be string").required("Name is required"),
  email: yup.string().email("Must be valid email").required("Email is requrie"),
  contact: yup.string().required("Contact is require"),
  password: yup
    .string()
    .min(8, "Password must be 8 characters long")
    .required("Password is required"),
});

module.exports = { create_account_validater };
