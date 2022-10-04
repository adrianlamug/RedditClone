import React from "react";
import { PracticeField } from "../components/PracticeField";

interface practiceProps {}

const Practice: React.FC<practiceProps> = ({}) => {
  const [v, someFunction] = PracticeField({ user: "", y: "" });
  console.log("hello", v.user);
  return (
    <div>
      <p>hello</p>
      {/* <input name="user" value={values.x} onChange={someFunction} /> */}
      <input name="user" value={v.user} onChange={someFunction} />
    </div>
  );
};

export default Practice;
