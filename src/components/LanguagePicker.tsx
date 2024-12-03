import { FC, useEffect, useRef, useState } from "react";
import { ZubaanLanguage, LANGUAGES } from "../utils/languages";

type LanguagePickerProps = {
  onChange: (lang: ZubaanLanguage) => void;
  label: string;
  defaultLang: ZubaanLanguage;
  fieldName: string;
};

const LanguagePicker: FC<LanguagePickerProps> = ({
  onChange,
  label,
  defaultLang,
  fieldName,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [currentLanguage, setCurrentLanguage] =
    useState<ZubaanLanguage>(defaultLang);

  useEffect(() => {
    // When defaultLang changes, update the currentLanguage state
    setCurrentLanguage({
      ...defaultLang,
    });
    console.log("defaultLang updated:", defaultLang);
  }, [defaultLang]);

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
          value={defaultLang.name}
          readOnly
          placeholder="Type here"
          className="input input-bordered w-full"
        />
      </label>

      {/* Modal for Language Picker */}
      <dialog
        ref={dialogRef}
        id="my_modal_5"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg text-center">Pick a language</h3>
          <ul className="max-h-[300px] overflow-auto">
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{lang.name}</span>
                  <input
                    checked={currentLanguage.code === lang.code}
                    type="radio"
                    name={fieldName}
                    className="radio"
                    value={lang.code}
                    onChange={() => setCurrentLanguage(lang)}
                  />
                </label>
              </div>
            ))}
          </ul>
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setCurrentLanguage({ ...defaultLang });
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
