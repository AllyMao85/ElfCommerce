import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Col } from 'reactstrap';
import Login from './containers/login';
import Dashboard from './containers/dashboard/dashboard';
import CustomerList from './containers/customerList';
import {
  OrderList,
  Order,
  ProductList,
  CategoryList,
  Payment,
  Setting,
  Category,
  Product,
  SalesReportList,
  SupplierList,
  Supplier,
  ManufacturerList,
  Manufacturer,
} from './containers';
import NavBar from './containers/navigation';
import SideBarContent from './components/sideBar';
import PrivateRoute from './privateRoute';

const routes = [
  {
    path: '/dashboard',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <Dashboard />,
  },
  {
    path: '/orders',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <OrderList />,
  },
  {
    path: '/orders/:id',
    sidebar: () => <SideBarContent />,
    main: () => <Order />,
  },
  {
    path: '/new-order',
    sidebar: () => <SideBarContent />,
    main: () => <Order />,
  },
  {
    path: '/categories',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <CategoryList />,
  },
  {
    path: '/categories/:id',
    sidebar: () => <SideBarContent />,
    main: () => <Category />,
  },
  {
    path: '/new-category',
    sidebar: () => <SideBarContent />,
    main: () => <Category />,
  },
  {
    path: '/customers',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <CustomerList />,
  },
  {
    path: '/products',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <ProductList />,
  },
  {
    path: '/new-product',
    sidebar: () => <SideBarContent />,
    main: () => <Product />,
  },
  {
    path: '/products/:id',
    sidebar: () => <SideBarContent />,
    main: () => <Product />,
  },
  {
    path: '/suppliers',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <SupplierList />,
  },
  {
    path: '/new-supplier',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <Supplier />,
  },
  {
    path: '/suppliers/:id',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <Supplier />,
  },
  {
    path: '/manufacturers',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <ManufacturerList />,
  },
  {
    path: '/new-manufacturer',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <Manufacturer />,
  },
  {
    path: '/manufacturers/:id',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <Manufacturer />,
  },
  {
    path: '/payments',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <Payment />,
  },
  {
    path: '/sales-reports',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <SalesReportList />,
  },
  {
    path: '/settings',
    exact: true,
    sidebar: () => <SideBarContent />,
    main: () => <Setting />,
  },
];

const App = () => (
  <Router>
    <div>
      <Route exact path="/" component={Login} />
      <div className="dashboard-page">
        <Col md={2} className="sidebar">
          <div id="site-name">
            ELFCommerce
          </div>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              exact={route.exact}
              component={route.sidebar}
            />
          ))}
        </Col>
        <Col md={{ size: 10, offset: 2 }} style={{ padding: 0 }}>
          <NavBar />
          {routes.map((route, index) => (
            <PrivateRoute
              key={index}
              path={route.path}
              exact={route.exact}
              component={route.main}
            />
          ))}
        </Col>
      </div>
    </div>
  </Router>
);

export default App;
