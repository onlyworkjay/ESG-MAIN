import styles from "./Button.module.css";

const Button = ({ children, type = "button", className, ...props }) => {
  const classList = className.split(" ");
  const classStyles = classList.map((cls) => {
    return styles[cls];
  });
  return (
    <button type={type} className={classStyles.join(" ")} {...props}>
      {children}
    </button>
  );
};

export default Button;
