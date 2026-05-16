export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg text-foreground mb-4">🧸 ToyStore</h3>
            <p className="text-sm">
              Ứng dụng mua sắm đồ chơi và mô hình hiện đại dành cho mọi lứa tuổi.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Danh mục</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition">Đồ chơi giáo dục</a></li>
              <li><a href="#" className="hover:text-primary transition">LEGO & Lắp ráp</a></li>
              <li><a href="#" className="hover:text-primary transition">Mô hình nhân vật</a></li>
              <li><a href="#" className="hover:text-primary transition">Đồ chơi vận động</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-primary transition">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-primary transition">Theo dõi đơn hàng</a></li>
              <li><a href="#" className="hover:text-primary transition">Liên hệ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Đăng ký nhận tin</h4>
            <p className="text-sm mb-4">Nhận thông tin về các ưu đãi mới nhất.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                Gửi
              </button>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ToyStore. Môn học Công nghệ mới trong phát triển phần mềm.</p>
        </div>
      </div>
    </footer>
  );
}
