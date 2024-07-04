import { FC, useRef, useState } from "react";
import { ZubaanLanguage, LANGUAGES } from "../utils/languages";

type LanguagePickerProps = {
  onChange: (lang: ZubaanLanguage) => void;
  label: string;
  defaultLang: ZubaanLanguage;
};

const LanguagePicker: FC<LanguagePickerProps> = ({
  onChange,
  label,
  defaultLang,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [currentLanguage, setCurrentLanguage] =
    useState<ZubaanLanguage>(defaultLang);
  return (
    <div className="py-2">
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">{label}</span>
        </div>
        <input
          onClick={() => {
            dialogRef.current?.showModal();
          }}
          type="text"
          value={currentLanguage.name}
          readOnly
          placeholder="Type here"
          className="input input-bordered w-full"
        />
      </label>

      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog
        ref={dialogRef}
        id="my_modal_5"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg text-center">Pick a language</h3>
          <ul className="max-h-[300px] overflow-auto">
            {LANGUAGES.map((lang, index) => {
              const checked = lang.code === currentLanguage.code;
              return (
                <div key={index} className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{lang.name}</span>
                    <input
                      defaultChecked={checked}
                      onChange={() => {
                        setCurrentLanguage(lang);
                      }}
                      type="radio"
                      name="language"
                      className={`radio ${checked? 'checked checked:bg-red-500' : ''}`}
                      value={lang.code}
                    />
                  </label>
                </div>
              );
            })}
          </ul>
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => {
                dialogRef.current!.close();
              }}
            >
              Close
            </button>
            <button
              onClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                onChange(currentLanguage);
                dialogRef.current!.close();
              }}
              className="btn btn-base-100"
              type="submit"
            >
              Save
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default LanguagePicker;
