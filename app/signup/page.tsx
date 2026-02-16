"use client";


import { signupAction  } from "./actions";
import React from "react";

const initialState = {error:""};

export default function SignupPage(){
    const [state, formAction] = React.useActionState(signupAction, initialState);

    return(
        <form
        action={formAction}
        className="flex flex-col gap-2 max-w-md mx-auto mt-10"
        >
            <h1 className="text-2xl font-bold mb-4 mx-auto"> Signup Form </h1>
            <input
            type="email"
            name="email"
            placeholder="Email"
            className="border p-2 rounded"
            />
              <input
            type="password"
            name="password"
            placeholder="Password"
            className="border p-2 rounded"
            />

            {state?.error &&(
                <p className="text-red-500 text-sm mx-auto"> {state.error} </p>
            )}

            <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded mt-2"
            >
                sign up
            </button>
        </form>
    )
}



