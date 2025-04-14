const yup = require("yup");

const request_to_create_account_validater = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Must be a valid email")
    .required("Email is required"),
  contact: yup.string().required("Contact is required"),
});

module.exports = { request_to_create_account_validater };
