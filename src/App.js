import React, { useState, useEffect } from 'react';
import './styles.css';


function App() {
  const [selectedOption, setSelectedOption] = useState('');
  const [data, setData] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [chickenQuantity, setChickenQuantity] = useState(0);

  const [result, setResult] = useState(null);


  useEffect(() => {
    fetchApiData();
  }, [selectedOption]);

  const fetchApiData = async () => {
    try {
      setLoading(true);
      const apiUrl = `http://localhost:8080/portion/${quantity}/ingredients/${selectedOption}`;
      const response = await fetch(apiUrl); 
      const data = await response.json();
      setData(data);
      setPrices(Array(data.length).fill(''));
      setEmpty(false)
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  function convert (weight){
    if (weight < 1.0){
      return `${weight * 1000} g`
    }
    return `${weight} kg`

  }
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleWeightChange = (event) =>{
    setQuantity(event.target.value);
    fetchApiData();
  }
  const handlePriceChange = (index, event) => {
    const updatedPrices = [...prices];
    updatedPrices[index] = event.target.value;
    setPrices(updatedPrices);
  };

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setLoading(true);
      const payload = {
        chicken_quantity: chickenQuantity,
        weighing: quantity,
        recipe_type: selectedOption,
        prices: data.map((item, index) => ({
          product_name: item.product_name,
          price_per_kg: parseFloat(prices[index]),
        })),
      };
      const apiUrl = `http://localhost:8080/portion`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      setResult(result)
      console.log('Data submitted successfully!');
    } catch (error) {
      console.error('Error submitting data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container'>
      <h1>Cálculo de Preço de Ração para Galinhas Caipiras de Postura</h1>
      <form onSubmit={handleSubmit}>
      <div className='weight'>
      <span className='title'>Quantas galinhas você tem</span>
        <input required
            type="number"
            value={chickenQuantity}
            onChange={(event) => setChickenQuantity(event.target.value)}
          />
      </div>
      <div className='weight'>
      <span className='title'>Quantos kg de ração você pretende fazer</span>
        <input required
            type="number"
            value={quantity}
            onChange={handleWeightChange}
          />
          <span>kg</span>
      </div>
      <h3>Qual das receitas:</h3>
      <div className='options'>
      <div className='radio-option'>
          <input
            type="radio"
            value="A"
            checked={selectedOption === 'A'}
            onChange={handleOptionChange}
          />
          <p>
          <span className='radio-text'>Receita simples</span>
          <span className='parentheses'>(menos ingredientes)</span>
          </p>
      </div>
      <div className='radio-option'>
          <input 
            type="radio"
            value="B"
            checked={selectedOption === 'B'}
            onChange={handleOptionChange}
          />
          <p>
            <span className='radio-text'>Receita caseira</span>
            <span className='parentheses'>(ingredientes encontrados na propriedade)</span>
          </p>
      </div>
      </div>
      {loading ? (
        <p>Carregando...</p>
      ) : !empty ? (
      <div className='ingredients-div'>
      <h3>Ingredientes</h3>
      <p className='description'>Insira nos campos o preço <span>por kg</span> de cada ingrediente</p>
      <ul className='ingredients'>
      {data.map((item, index) => (
        <li className='name' key={index}>
          <span className='radio-text'>{item.product_name} </span>
          <span className='parentheses'>{convert(item.weight_in_kg)}</span>
          <input className='price'
            type="number"
            value={prices[index]}
            onChange={(event) => handlePriceChange(index, event)}
          />
        </li>
      ))}
      </ul>
      </div>
      ) : (
      <div className='warning'>
      <p>Escolha uma das receitas</p>
      </div>
      )}
      <button type='submit'><span>Calcular</span></button>
      </form>
      {}
      {result && (
        <div className='result'>
          <h3>Resultado:</h3>
            <p>{quantity}kg de ração de galinha com a receita selecionada te custará: </p>
            <p>Ao todo: {result.total_spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p>Por kg: {result.price_per_kg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p>A dúzia do ovo sai a: {result.egg_dozen_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p>{quantity}kg de ração para {chickenQuantity} galinhas durará {result.days_portion_will_last} dias</p>
            <p>{quantity}kg de ração para {chickenQuantity} galinhas renderá {result.total_egg_count} ovos ao fim de {result.days_portion_will_last} dias</p>
        </div>
      )}
    </div>
  );
}

export default App;
