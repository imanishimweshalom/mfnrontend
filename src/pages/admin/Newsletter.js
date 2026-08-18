import React, { useState } from "react";
import axios from "axios";


const Newsletter = () => {

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");



  const sendNewsletter = async (e) => {

    e.preventDefault();


    if(!subject.trim() || !message.trim()){

      setResult("Please fill subject and message");

      return;

    }



    try{


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

          headers:{

            Authorization:`Bearer ${token}`

          }

        }

      );



      console.log("Newsletter response:", res.data);



      setResult(

        `Success: ${
          res.data.message ||
          "Newsletter sent successfully"
        } ${
          res.data.total
          ?
          `(${res.data.total} subscribers)`
          :
          ""
        }`

      );



      setSubject("");

      setMessage("");



    }catch(err){


      console.log("Newsletter error:", err);



      setResult(

        err.response?.data?.error ||

        "Failed to send newsletter"

      );


    }finally{


      setLoading(false);


    }


  };




  return (

    <div className="admin-page">


      <h1>
        Newsletter
      </h1>


      <p>
        Send email to all subscribers
      </p>



      <form onSubmit={sendNewsletter}>


        <div>

          <label>
            Subject
          </label>


          <input

            type="text"

            value={subject}

            onChange={(e)=>setSubject(e.target.value)}

            placeholder="Newsletter subject"

          />

        </div>




        <div>

          <label>
            Message
          </label>


          <textarea

            rows="8"

            value={message}

            onChange={(e)=>setMessage(e.target.value)}

            placeholder="Write your newsletter message here..."

          />


        </div>




        <button disabled={loading}>


          {
            loading
            ?
            "Sending..."
            :
            "Send Newsletter"
          }


        </button>




      </form>




      {

        result &&

        <div className="message">

          {result}

        </div>

      }



    </div>

  );

};


export default Newsletter;