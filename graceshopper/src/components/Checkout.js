import { loadStripe } from "@stripe/stripe-js";
import {
  Elements
} from "@stripe/react-stripe-js";

import "./Checkout.css"
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import { useEffect, useState } from "react";
import {getProductForGuests} from '../auth'
// import TakeMoney from './StripeCheckout'
import CheckoutForm from './StripeCheckout'
const API = "https://peaceful-spire-60083.herokuapp.com/api/orders";
// import StripeCheckout from 'react-stripe-checkout';
const stripePromise = loadStripe("pk_test_51Iei4JBoHWwkzUsZILLciQCW97S5JTpLMZak2X4ckbSdJUnT2CcRywoxeNb0Ez1fcyBtVzETYR1MJnLlKAtpf9xi00hJBUHQdx");

const Checkout = ({userId, orders, setOrders}) => {
    const [ orderConfirmed, setOrderConfirmed ] = useState(false)
    const [count, setCount] = useState()
    const tax = 1.10;
    let subtotal = 0;
    let total = 0;
    const getOrders = () => {
        fetch(`${API}/${userId}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            setOrders(data);
        })
        .catch(console.error);
    };


    const makePending = () => {
        orders.forEach((order) => {
            fetch(`https://peaceful-spire-60083.herokuapp.com/api/orders/${order.id}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderStatus: 'pending',
                }),
              })
            .then((response) => response.json())
            .then((data) => {
                console.log(data, "order is pending");
                setOrderConfirmed(true)
            })
            .catch(console.error);
        })
      }

    const deleteOrder = (orderId) => {
        fetch(
          `https://peaceful-spire-60083.herokuapp.com/api/orders/${orderId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => response.json())
          .then((result) => {
            console.log(result);
            if (result) {
              const updatedOrders = orders.filter(
                (order) => order.id !== orderId
              );
              setOrders(updatedOrders);
            }
          })
          .catch(console.error);
      }

    // const userOrder = orders.filter((order) => {
    //     if(order.userId == userId){
    //         return order
    //     }
    // })

    // console.log(userOrder)

    useEffect(() => {
        if(userId){
            getOrders();
        } else {
            getProductForGuests()
        }
    }, []);


    return (
        <>
        <div className="orderCheckout">
            <h1> Secure Checkout </h1>
            <p> We hope you enjoy your purchase ^_^ </p>
        </div>
        
        <section>
            <Table className = "left" striped bordered hover>
                <thead>
                    <tr>
                    <th>#</th>
                    <th>Game Name</th>
                    <th>Price</th>
                    <th>Delete</th>
                    </tr>
                </thead>
                {orders.map((order, index) => {
                    subtotal = Math.round((subtotal + order.productPrice) * 100) / 100;
                    total = Math.round(subtotal * tax * 100) / 100;
                    return (
                        <tbody key={index}>
                            <tr>
                                <td>{order.count}</td>
                                <td>{order.productTitle}</td>
                                <td>{order.productPrice}</td>
                                <td> 
                                    <button
                                        className="deleteButton"
                                        onClick={() => deleteOrder(order.id)}
                                    >
                                        Remove Item
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    )
                    })
                }
            </Table>
            <div className="orderTotal">
                <h6>Subtotal: {subtotal}</h6>
                <h6>Tax: 10%</h6>
                
                <h6>Total: {total} </h6>
                <button onClick={makePending}> 
                    Confirm Order 
                </button>
            </div>

            { orderConfirmed ? 
            <div className="AppWrapper">
                <Elements stripe={stripePromise} >
                    <CheckoutForm 
                    amount={total}
                    orders={orders}
                    setOrderConfirmed={setOrderConfirmed}
                    />
                </Elements>
            </div>
            : null}
        </section>
        </>
    )
}

export default Checkout;