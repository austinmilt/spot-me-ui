import React, { createContext, ReactNode, useContext, useMemo, useState } from "react";


export interface ModalState {
    show: boolean;
    content: React.ReactNode | undefined;
    setShow: (show: boolean) => void;
    setContent: (content: React.ReactNode | undefined) => void;
    setContentAndUpdateShow: (content: React.ReactNode | undefined) => void;
}


export const ModalContext = createContext<ModalState>(
    {} as ModalState
);


export function useModal(): ModalState {
    return useContext(ModalContext);
}


export function ModalProvider(props: { children: ReactNode }): JSX.Element {
    const [show, setShow] = useState<boolean>(false);
    const [content, setContent] = useState<React.ReactNode | undefined>();

    const value: ModalState = useMemo(() => ({
        setShow: setShow,
        setContent: setContent,
        setContentAndUpdateShow: (content) => {
            setContent(content);
            if (content == null) {
                setShow(false);
            } else {
                setShow(true);
            }
        },
        show: show,
        content: content
    }), [show, content]);

    return (
        <ModalContext.Provider value={value}>
            {props.children}
        </ModalContext.Provider>
    );
}


export function Modal(): JSX.Element {
    const { show, content, setShow } = useModal();
    return (<>
        {show && (
            <div
                style={{
                    position: "fixed",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%"
                }}
                onClick={() => setShow(false)}
            >
                {content}
            </div>
        )}
    </>)
}
