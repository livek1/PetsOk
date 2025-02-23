import { FC, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface DateSelectorProps {
  selectDate: (date: string) => void; // Функция принимает строку
}

const DateSelector: FC<DateSelectorProps> = ({ selectDate }) => {
  const [selected, setSelected] = useState<Date | undefined>();

  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
    if (date) {
      selectDate(date.toLocaleDateString());
    }
  };

  return (
    <div>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={handleSelect}
        footer={
          selected
            ? `Selected: ${selected.toLocaleDateString()}`
            : "Pick a day."
        }
      />
    </div>
  );
};

export default DateSelector;
