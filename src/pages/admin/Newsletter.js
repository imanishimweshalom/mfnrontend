import React, { useState } from "react";
import axios from "axios";


const Newsletter = () => {

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");


  const sendNewsletter = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);
      setResult("");


      const token = localStorage.getItem("token");


      const res = await axios.post(

        `${process.env.REACT_APP_API_URL}/api/newsletter/send`,

        {
          subject,
          message
        },

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      );


      setResult(
        `Success: ${res.data.message} (${res.data.sentTo} subscribers)`
      );


      setSubject("");
      setMessage("");


    } catch (error) {

      console.log(error);


      setResult(
        error.response?.data?.error ||
        "Failed to send newsletter"
      );


    } finally {

      setLoading(false);

    }

  };


  return (

    <div>

      <h2>Send Newsletter</h2>


      <form onSubmit={sendNewsletter}>


        <input

          type="text"

          value={subject}

          onChange={(e)=>setSubject(e.target.value)}

          placeholder="Newsletter subject"

          required

        />


        <br />


        <textarea

          value={message}

          onChange={(e)=>setMessage(e.target.value)}

          placeholder="Write newsletter message"

          rows="8"

          required

        />


        <br />


        <button

          type="submit"

          disabled={loading}

        >

          {
            loading
            ? "Sending..."
            : "Send Newsletter"
          }

        </button>


      </form>


      {
        result &&

        <p>
          {result}
        </p>
      }


    </div>

  );

};


export default Newsletter;
