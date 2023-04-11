// import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  // const error: any = useRouteError();
  // console.error(error);

  return (
    <div id="error-page">
      <h1>糟糕!</h1>
      <p>好像出了一些错误。</p>
      <p>
        {/* <i>{error.statusText || error.message}</i> */}
      </p>
    </div>
  );
}
