import React, { useState, useEffect } from "react";
import $ from 'jquery-ajax';
import "./creditcardapp.css";
import Form from './components/AddNewCreditCards';
import CardList from './components/CardList';
import ValidationErrors from './hooks/ValidationErrors';

const urlGetAll = "http://localhost:8080/creditCard/getAll";
const urlAdd = "http://localhost:8080/creditCard/add";


function App() {
    const [card, setCard] = useState({
        name: '', cardNumber: '', limit: 0
    });
    const [validationErrors, setValidationErrors] = useState({
        name: false, cardNumber: false, limit: false
    });
    const [cardList, setCardList] = useState([]);

    useEffect(() => {
        $.get(urlGetAll, response => setCardList(response));
    }, []);


    const handleInputChange = event => {
        let obj = {[event.target.name] : event.target.value};
        setCard(() => ({ ...card, ...obj }));
    }

    const isFormValid = () => {
        const nameRegex = /^[^0-9.]+$/;
        const limitRegex = /^[0-9]+$/;
        let errors = {name: true, cardNumber: true, limit: true};
        if (nameRegex.test(card.name))
            errors.name = false;
        if (checkCardNumber())
            errors.cardNumber = false;
        if (limitRegex.test(card.limit) && card.limit >= 100)
            errors.limit = false;
        setValidationErrors(errors);
        return !Object.values(errors).some(error => error === true);
    }

    const checkCardNumber = () => {
        const cardNumber = card.cardNumber.replace(/ /g,'').replace(/-/g,'');
        return cardNumber.length >= 16 && cardNumber.length <= 19
            && checkLuhn10(cardNumber);
    }

    const checkLuhn10 = cardNumber => {
        let sum = 0;
        for (let i=0; i<cardNumber.length; i++){
            let digit = Number(cardNumber.charAt(i));
            if (i % 2 === 0) {
                digit *= 2;
                if (digit > 9)
                    digit -= 9;
            }
            sum += digit;
        }
        return (sum % 10) === 0;
    }

    const addCard = () => {
        if (isFormValid()){
            $.ajax({
                url:urlAdd,
                type:"POST",
                data:JSON.stringify(card),
                contentType:"application/json;charset=utf-8",
                success: function(r){
                    setCardList( [...cardList, card] );
                    setCard({name: '', cardNumber: '', limit: ''});
                },
                error: function(xhr, status, error){
                    if (xhr.status === 409) {
                        alert("A Credit Card with that number already exists!");
                    } else {
                        alert("A service error occurred, please try again later!");
                    }
                }
            });
        }
    }

    return (
        <div className="App">
            <h1>Credit Card System</h1>
            <h2> Add </h2>
            <Form card={card}
                  handleInputChange={handleInputChange}
                  addCard={addCard} />

            <ValidationErrors errors={validationErrors} />
            <CardList cards={cardList} />


        </div>
    );
}

export default App;