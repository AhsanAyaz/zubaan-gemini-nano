import React from "react";

type LoadingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  modelLoadingProgresses: Record<
    string,
    { name: string; file: string; progress: number }
  >;
};

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  onClose,
  modelLoadingProgresses,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Model Loading Progress</h3>
        <small className="mb-4 block">
          Note: The models will be loaded once, and then will be cached and
          reused.
        </small>
        <div className="space-y-2">
          {Object.values(modelLoadingProgresses).map((progress) => (
            <div key={progress.file} className="w-full">
              <div className="flex justify-between text-xs mb-1">
                <span>{`${progress.name}: ${progress.file}`}</span>
                <span>{`${progress.progress}%`}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${progress.progress}%`,
                    transition: "width 0.5s ease-in-out",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
