export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-8">Attitude Admin</h2>
        <nav className="flex flex-col gap-4">
          <a href="/admin/dashboard" className="hover:text-blue-400">Dashboard</a>
          <a href="/admin/products" className="hover:text-blue-400">Products</a>
          <a href="/admin/orders" className="hover:text-blue-400">Orders</a>
          <a href="/admin/customers" className="hover:text-blue-400">Customers</a>
        </nav>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}