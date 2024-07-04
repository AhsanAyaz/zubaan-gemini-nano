import Chat from "./components/Chat"
import Header from "./components/Header"

const Home = () => {
  return (
    <>
      <Header />
      <main className='min-h-[calc(100vh - 68px)] max-w-md md:max-w-xl mx-auto' style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        <Chat />
      </main>
    </>
  )
}

export default Home