import CartItemList
 from '../component/cartItem'
import BottomNav from '../component/BottomNav'
export default function Cart() {
  return (
    <>
      <main style={{padding:0}}>
        <h2>Cart</h2>
        <CartItemList />
      </main>
      <BottomNav />
    </>
  )
}
