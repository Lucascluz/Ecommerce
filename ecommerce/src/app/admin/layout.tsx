import { Nav, NavLink } from "@/components/Nav";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Nav>
        <NavLink href={"/admin"}>DashBoard</NavLink>
        <NavLink href={"/admin/products"}>Products</NavLink>
        <NavLink href={"/admin/users"}>Customers</NavLink>
        <NavLink href={"/admin/orders"}>Customers</NavLink>
      </Nav>
      <div className="container my-6">{children}</div>
    </>
  );
}
