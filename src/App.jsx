import './App.css';
import { useEffect, useState } from 'react';
import md5 from 'md5';

const App = () => {
	const [fetchCheck, setFetchCheck] = useState(false)
	const [goods, setGoods] = useState(null)
	const [offset, setOffset] = useState(0)
	const [filtered, setFiltered] = useState(false)
	const [product, setProduct] = useState('')
	const [price, setPrice] = useState('')
	const [brand, setBrand] = useState('')

	const getKey = () => {
		const date = new Date()
		const format = (date) => date < 10 ? `0${date}` : date.toString()
		const year = date.getUTCFullYear()
		const month = format(date.getUTCMonth() + 1)
		const day = format(date.getUTCDate())
		const key = md5(`Valantis_${year}${month}${day}`)
		return key
	}

	const fetchRetry = async (body) => {
		let result = await fetch('https://api.valantis.store:41000/', {
			method: 'POST',
			mode: 'cors',
			headers: {
				'X-Auth': getKey(),
				'Content-Type': 'application/json;charset=UTF-8'
			},
			body: body
		})
		let response = await result.json()
		return response
	}

	useEffect(() => {
		setGoods(null)

		const body = JSON.stringify({
			action: 'get_ids',
			params: {
				limit: 50,
				offset: offset
			}
		})
		
		fetchRetry(body)
		.then((data) => {
			const body = JSON.stringify({
				action: 'get_items',
				params: {
					ids: data.result
				}
			})
			
			return fetchRetry(body)
		})
		.then((data) => {
			let cleanIds = []
			let cleanRes = []
			data.result.map((item) => {
				if(!cleanIds.includes(item.id)) {
					cleanIds.push(item.id)
					cleanRes.push(item)
				}
				else {
					return false
				}
			})
			setGoods(cleanRes)
		})
		.catch((error) => {
			console.error(error)
			setFetchCheck(prev => !prev)
		})

		return () => {}
	}, [fetchCheck, offset])

	const filter = () => {
		setGoods(null)
		setFiltered(true)

		const body = JSON.stringify({
			action: 'filter',
			params: {
				// product: product,
				price: Number(price),
				// brand: brand
			}
		})

		fetchRetry(body)
		.then((data) => {
			const body = JSON.stringify({
				action: 'get_items',
				params: {
					ids: data.result
				}
			})
			
			return fetchRetry(body)
		})
		.then((data) => {
			let cleanIds = []
			let cleanRes = []
			data.result.map((item) => {
				if(!cleanIds.includes(item.id)) {
					cleanIds.push(item.id)
					cleanRes.push(item)
				}
				else {
					return false
				}
			})
			setGoods(cleanRes)
		})
		.catch((error) => {
			console.error(error)
		})
	}

	const filterReset = () => {
		setOffset(0)
		setFiltered(false)
	}

	return (
		<section id='catalog'>
			<div id='filter'>
				<h2>Фильтр</h2>
				<form>
					<ul>
						<li>
							<input type="text" placeholder='Введите название' onChange={(e) => setProduct(e.target.value)} />
						</li>
						<li>
							<input type="text" placeholder='Введите цену' onChange={(e) => setPrice(e.target.value)} pattern='\d' />
						</li>
						<li>
							<input type="text" placeholder='Введите бренд' onChange={(e) => setBrand(e.target.value)} />
						</li>
						<li>
							<button type='button' onClick={filter}>
								Применить
							</button>
						</li>
						<li>
							<button type="reset" onClick={filterReset}>
								Отменить
							</button>
						</li>
					</ul>
				</form>
			</div>
			<div id='list'>
				<ul>
					{goods ? (
						goods.map((item) =>
							<li key={item.id}>
								<article>
									<h3>{item.product}</h3>
									<span>ID: {item.id}</span>
									<span>Цена: {item.price}</span>
									<span>Бренд: {item.brand}</span>
								</article>
							</li>
						)
					) : (
						<h2 id='loading'>Загрузка...</h2>
					)}
				</ul>
			</div>
			<div id='pagination'>
				<ul>
					<li>
						<button onClick={() => setOffset(prev => prev - 50)} disabled={offset === 0 || filtered === true ? true : false}>
							Назад
						</button>
					</li>
					<li>
						<button onClick={() => setOffset(prev => prev + 50)} disabled={filtered === true ? true : false}>
							Далее
						</button>
					</li>
				</ul>
			</div>
		</section>
	);
}

export default App;