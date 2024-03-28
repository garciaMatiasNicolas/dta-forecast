import SignUpForm from "../components/users/SignUpForm.js"

const SignUp = () => {
  return (
    <div style={{"minHeight": "100vh"}} className="container w-100 flex-column d-flex justify-content-center align-items-center">
      <SignUpForm/>
    </div>
  )
}

export default SignUp