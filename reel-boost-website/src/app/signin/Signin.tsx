"use client";
import React, { useState } from "react";
import { Dialog } from "@mui/material";
import { useAppSelector } from "../utils/hooks";
import { useAppDispatch } from "../utils/hooks";
import { hideModal } from "../store/Slice/ModalsSlice";
import PhoneSignin from "./PhoneSignin";
import EmailSignin from "./EmailSignin";
import SocialLogin from "./SocialLogin";

function Signin() {
  const [selectedOption, setSelectedOption] = useState("Phone");
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.modals.Signin);

  return (
    <>
      <Dialog
        open={open}
        onClose={() => dispatch(hideModal("Signin"))}
        fullWidth
        PaperProps={{
          sx: {
            p: 0,
            overflow: "visible",
            borderRadius: 3,
            maxHeight: "90vh",
            width: "420px",
            maxWidth: "100%",
          },
        }}
        BackdropProps={{ sx: { background: "#000000BD" } }}
      >
        <div className="">

          <button
          onClick={() => dispatch(hideModal("Signin"))}
          className="absolute top-2 right-2 text-dark rounded-full p-2 hover:text-gray-800 transition cursor-pointer"
        >
          ✕
        </button>
          <>
            <div
              style={{ boxShadow: "9.3px 10.46px 64.96px 0px #00000026" }}
              className="py-8 rounded-xl"
            >
              {/* Title */}
              <h3 className="pb-4 text-[20px] font-medium text-dark text-center">
                Signin
              </h3>
              <div
                className="flex justify-around items-center border border-main-green/[0.1] mx-6 rounded-full p-3"
                style={{ boxShadow: "1px 1px 6.7px 0px #00000008" }}
              >
                <button
                  className={`cursor-pointer text-[16px] font-medium ${
                    selectedOption === "Phone" ? "text-main-green" : "text-gray"
                  }`}
                  onClick={() => setSelectedOption("Phone")}
                >
                  Phone
                </button>

                <div
                  className="w-0.5 h-4"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(35, 156, 87, 0.12), rgba(1, 159, 200, 0.12))",
                  }}
                ></div>

                <button
                  className={`cursor-pointer text-[16px] font-medium ${
                    selectedOption === "Email" ? "text-main-green" : "text-gray"
                  }`}
                  onClick={() => setSelectedOption("Email")}
                >
                  Email
                </button>
              </div>

              <div className=" pt-8 px-10">
                {selectedOption === "Phone" && <PhoneSignin />}
                {selectedOption === "Email" && <EmailSignin />}
              </div>

              {/* <p className="font-light text-dark text-sm text-center pt-5">
                Don&apos;t have an account?{" "}
                <span
                  className="text-main-green font-medium cursor-pointer hover:underline"
                  onClick={() => {
                    dispatch(showModal("Signup"));
                    dispatch(hideModal("Signin"));
                  }}
                >
                  Signup
                </span>
              </p> */}

              <div className="flex items-center justify-center py-4 px-10 w-full">
                <div className="flex-grow border-t border-main-green"></div>
                <h1 className="mx-4 text-sm font-poppins text-dark font-base">
                  OR
                </h1>
                <div className="flex-grow border-t border-main-green"></div>
              </div>
              {/* Social Login ============================= */}
              <SocialLogin />
            </div>
          </>

          {/* Divider */}
        </div>
      </Dialog>
    </>
  );
}

export default Signin;
