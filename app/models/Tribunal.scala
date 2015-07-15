package models

import com.rabbitmq.client.ConnectionFactory
import com.rabbitmq.client.Connection
import com.rabbitmq.client.Channel
import com.rabbitmq.client.QueueingConsumer
import com.rabbitmq.client.AMQP.BasicProperties
import plm.core.model.Game
import play.api.Logger
import actors.PLMActor
import play.api.libs.json._
import play.api.Play
import play.api.Play.current

object Tribunal {
  var QUEUE_ADDR = Play.configuration.getString("messagequeue.url").getOrElse("localhost:5672")
  def askGameLaunch(plmActor:PLMActor, gitGest:Git, game:Game, lessonID:String, exerciseID:String, code:String) {
    // Parameters 
    var QUEUE_NAME_REQUEST : String = "worker_in"
    var QUEUE_NAME_REPLY : String = "worker_out"
    var corrId : String = java.util.UUID.randomUUID().toString();
    
    // This part handles compilation with workers.
// Properties
    var props : BasicProperties = new BasicProperties.Builder().correlationId(corrId).replyTo(QUEUE_NAME_REPLY).build()
// Connection
    var factory : ConnectionFactory = new ConnectionFactory()
    factory.setHost(QUEUE_ADDR)
    var connection : Connection  = factory.newConnection()
    var channelOut : Channel = connection.createChannel()
    var channelIn : Channel = connection.createChannel()
    channelOut.queueDeclare(QUEUE_NAME_REQUEST, false, false, false, null)
    channelIn.queueDeclare(QUEUE_NAME_REPLY, false, false, false, null)
//Request
    var msg : JsValue = Json.obj(
          "lesson" -> ("lessons." + lessonID),
          "exercise" -> exerciseID,
          "localization" -> game.getLocale.getLanguage,
          "language" -> game.getProgrammingLanguage.getLang,
          "code" -> code
        )
    channelOut.basicPublish("", QUEUE_NAME_REQUEST, props,
        msg.toString.getBytes("UTF-8"))
// Reply
    Logger.debug("waiting for logs as " + corrId)
    var consumer : QueueingConsumer = new QueueingConsumer(channelIn)
    channelIn.basicConsume(QUEUE_NAME_REPLY, false, consumer)
    var state: Boolean = true;
    while(state) {
      var delivery : QueueingConsumer.Delivery = consumer.nextDelivery(1000)
      if(delivery == null) {
        Logger.debug("Execution timeout : sending data about it.")
        plmActor.sendMessage("executionResult", Json.obj(
            "outcome" -> "UNKNOWN",
            "msgType" -> "0",
            "msg" -> "The compiler crashed unexpectedly."))
        state = false;
      }
      else {
        if (delivery.getProperties().getCorrelationId().equals(corrId)) {
          channelIn.basicAck(delivery.getEnvelope().getDeliveryTag(), false)
          var message : String = new String(delivery.getBody(), "UTF-8");
          var replyJSON = Json.parse(message)
          (replyJSON \ "msgType").asOpt[Int].getOrElse(None) match {
            case (msgType:Int) =>
              gitGest.gitEndExecutionPush(replyJSON, code);
              Logger.debug("Executed - Now sending the exercise's result")
              plmActor.sendMessage("executionResult", Json.parse(message))
              state = false;
            case (_) =>
              Logger.debug("The world moved!")
              plmActor.sendMessage("operations", Json.parse(message))
          }
        }
        else
          channelIn.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true)
      }
    }
    channelOut.close();
    channelIn.close();
    connection.close();
  }
}
