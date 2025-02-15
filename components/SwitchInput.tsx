import { FC } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type SwitchInputProps = {
  label: string;
  register: UseFormRegisterReturn;
};

const SwitchInput: FC<SwitchInputProps> = ({ label, register }) => {
  return (
    <div className="switch-input">
      <label>
        {label}:
        <input type="checkbox" {...register} />
      </label>
    </div>
  );
};

export default SwitchInput;
