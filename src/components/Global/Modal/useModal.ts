import { useState } from 'react';

export const useModal = (modalCloseCustom?: () => void, initialMode = false) => {
    // create a useState hook to track if the modal should be rendered
    const [isModalOpen, setIsModalOpen] = useState<boolean>(initialMode);

    // TODO:  'closeModalOptions' is a magic value (must be defined in multiple files)
    // TODO:  ... we should rework things such that it only needs to be defined once

    // click handlers to to open and close the modal
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        // close the modal
        setIsModalOpen(false);
        // emit a custom event to trigger extra functionality on modal close
        const closeEvent = new CustomEvent('closeModalOptions', {
            bubbles: true,
        });
        // dispatch the event on the modal being closed
        document.getElementById('Modal_Global')?.dispatchEvent(closeEvent);
        // remove the event listener from  the window
        // the presence of a close function implies the event listener was created
        modalCloseCustom && window.removeEventListener('closeModalOptions', modalCloseCustom);
    };

    // return all data and functions needed for local use
    return [isModalOpen, openModal, closeModal] as const;
};
