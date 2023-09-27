import React from "react";

const Notice: React.FC = () => {
    const style = {
        width: "300px",
        backgroundColor: "#beddfe",
        color: "#005ec2",

        borderRadius: "5px",
        padding: "20px",
        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
        margin: "20px",
        fontFamily: "Arial, sans-serif",
    };

    return (
        <div style={style}>
            <strong>Note!</strong>
            <br />
            For demo purposes, a new smart account is created every time you authenticate.
        </div>
    );
};

export default Notice;
