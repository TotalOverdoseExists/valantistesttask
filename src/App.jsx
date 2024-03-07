import './App.css';
import { Fragment, useEffect, useState } from 'react';
import md5 from 'md5';

const App = () => {
	const [ids, setIds] = useState(null)
	const [goods, setGoods] = useState(null)
	const [offset, setOffset] = useState(0)

	const getKey = () => {
		const date = new Date()
		const format = (date) => date < 10 ? `0${date}` : date.toString()
		const year = date.getFullYear()
		const month = format(date.getMonth() + 1)
		const day = format(date.getDate())
		const key = md5(`Valantis_${year}${month}${day}`)
		return key
	}

	useEffect(() => {
		const controller = new AbortController()
		const signal = controller.signal

		const body = JSON.stringify({
			'action': 'get_ids',
			'params': {
				offset: 0
			}
		})

		fetch('https://api.valantis.store:41000/', {
			method: 'POST',
			mode: 'cors',
			headers: {
				'X-Auth': getKey(),
				'Content-Type': 'application/json;charset=UTF-8'
			},
			body: body,
			signal: signal
		})
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			setIds(data.result)
		})
		.catch((error) => {
			if(error.name === 'AbortError') {
				console.log('successfully aborted')
			}
			else {
				console.info(error)
			}
		})

		return () => {
			controller.abort()
		}
	}, [])

	useEffect(() => {
		const controller = new AbortController()
		const signal = controller.signal

		const body = JSON.stringify({
			'action': 'get_ids',
			'params': {
				limit: 3,
				offset: offset
			}
		})
		
		fetch('https://api.valantis.store:41000/', {
			method: 'POST',
			mode: 'cors',
			headers: {
				'X-Auth': getKey(),
				'Content-Type': 'application/json;charset=UTF-8'
			},
			body: body,
			signal: signal
		})
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			const body = JSON.stringify({
				'action': 'get_items',
				'params': {
					ids: data.result
				}
			})
			
			return fetch('https://api.valantis.store:41000/', {
				method: 'POST',
				mode: 'cors',
				headers: {
					'X-Auth': getKey(),
					'Content-Type': 'application/json;charset=UTF-8'
				},
				body: body,
				signal: signal
			})
		})
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			setGoods(data.result)
		})
		.catch((error) => {
			if(error.name === 'AbortError') {
				console.log('successfully aborted')
			}
			else {
				console.info(error)
			}
		})

		return () => {
			controller.abort()
		}
	}, [offset])

	return (
		<Fragment>
			<h1>Товары</h1>
			<section id='catalog'>
				<div id='filter'>
					<h2>Фильтр</h2>
					<ul>
						<li>
							<button>
								Название
							</button>
						</li>
						<li>
							<button>
								Цена
							</button>
						</li>
						<li>
							<button>
								Бренд
							</button>
						</li>
					</ul>
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
					{/* {ids ? (
						ids.map((item) =>
							<p key={item}>{item}</p>
						)
					) : (
						<h2>Загрузка...</h2>
					)} */}
					<ul>
						<li>
							<button onClick={() => setOffset(0)}>
								Назад
							</button>
						</li>
						<li>
							<input type="text" defaultValue='0' />
						</li>
						<li>
							<button onClick={() => setOffset(50)}>
								Дальше
							</button>
						</li>
					</ul>
				</div>
			</section>
		</Fragment>
	);
}

export default App;