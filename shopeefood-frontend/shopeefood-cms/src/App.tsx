import { ToastContainer } from 'react-toastify'
import useRouteElements from './routes/useRouteElements';

function App() {
  const routeElements = useRouteElements();
  return (
    <div>
      {/* Nơi hiển thị toàn bộ nội dung trang web */}
      {routeElements}

      {/* Nơi đặt các thành phần Global như thông báo */}
      <ToastContainer />
    </div>
  );
}

export default App
