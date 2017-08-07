using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceStack.ServiceHost;
using ServiceStack.OrmLite;
using WebApi.ServiceModel.Tables;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
namespace WebApi.ServiceModel.TMS
{
    [Route("/tms/jmjm1", "Get")]  //DeliveryAgentCode=
    [Route("/tms/jmjm1/confirm", "Post")] //

    public class Jmjm : IReturn<CommonResponse>
    {
        public string DeliveryAgentCode { get; set; }
        public string confirmAllString { get; set; }
    }
    public class Jmjm_logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Jmjm1> Get_Jmjm1_List(Jmjm request)
        {

            List<Jmjm1> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("TMS"))
                {
                    string strSql = "";
                    string strWhere = " Where (DeliveryDateTime >=  getdate() " +
                                      "  or  DeliveryDateTime is null) " +                              
                                      " And ModuleCode='AE' " +
                                      " And DeliveryAgentCode is not null And DeliveryAgentCode !='' And DeliveryAgentCode ='" + request.DeliveryAgentCode + "' ";
                    strSql = " select  JobNo, DeliveryAgentCode,CONVERT(varchar(16), ETA, 20) as ETA , Pcs, AwbBlNo, '' as UpdatedFlag," +
                             " (select isnull(aeaw1.ConsigneeAddress1,'') + isnull(aeaw1.ConsigneeAddress2,'') + isnull(ConsigneeAddress3,'') +isnull(aeaw1.ConsigneeAddress4,'') from aeaw1 where aeaw1.JobNo=jmjm1.JobNo  ) as Address," +
                             " ConsigneeName ,CONVERT(varchar(16), (select top 1  Jmjm3.DateTime   from jmjm3 where Jmjm3.JobNo=Jmjm1.JobNo and Jmjm3.Description = 'ACTUAL ARRIVAL DATE' order by Jmjm3.lineItemNo desc ), 20)  as  ActualArrivalDate, " +
                             " CONVERT(varchar(16),DeliveryDateTime, 20) as DeliveryDate " +
                             " from jmjm1 " + strWhere + " ";
                    Result = db.Select<Jmjm1>(strSql);

                }
            }
            catch { throw; }
            return Result;
        }
        public int ConfirmAll_Jmjm1(Jmjm request)
        {
            int Result = -1;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection())
                {
                    if (request.confirmAllString != null && request.confirmAllString != "")
                    {
                        JArray ja = (JArray)JsonConvert.DeserializeObject(request.confirmAllString);
                        if (ja != null)
                        {
                            for (int i = 0; i < ja.Count(); i++)
                            {
                                string strJobNo = "";
                                string strActualArrivalDate = "";
                                string strDeliveryDate = "";
                                if (ja[i]["JobNo"] != null || ja[i]["JobNo"].ToString() != "")
                                strJobNo = ja[i]["JobNo"].ToString();
                                strActualArrivalDate = ja[i]["ActualArrivalDate"].ToString();
                                strDeliveryDate = ja[i]["DeliveryDate"].ToString();
                                if (strJobNo != "")
                                {
                                    if (strActualArrivalDate != "") {
                                        int count = db.Scalar<int>("Select Count(JobNo) from Jmjm3 where JobNo='" + Modfunction.SQLSafe(strJobNo) + "' and Description = 'ACTUAL ARRIVAL DATE'" );
                                        if (count > 0)
                                        {
                                    db.Update("Jmjm3",
                                      " DateTime = '" + Modfunction.SQLSafe(strActualArrivalDate) + "'",
                                              " JobNo='" + Modfunction.SQLSafe(strJobNo) + "' and Description = 'ACTUAL ARRIVAL DATE'");
                                        }
                                        else {
                                            count = db.Scalar<int>("Select Max(LineItemNo) from Jmjm3 where JobNo='" + Modfunction.SQLSafe(strJobNo) + "'");
                                            count = count + 1;
                                            string updateBy= db.Scalar<string>("Select DeliveryAgentCode from jmjm1 Where JobNo='" + Modfunction.SQLSafe(strJobNo) + "'");
                                            db.Insert(new Jmjm3
                                            {
                                                JobNo = strJobNo,
                                                DateTime = Convert.ToDateTime(strActualArrivalDate),
                                                UpdateDatetime = DateTime.Now,
                                                LineItemNo = count,
                                                AutoFlag = "N",
                                                StatusCode = "",
                                                UpdateBy = updateBy,
                                                Description = "ACTUAL ARRIVAL DATE"
                                            });                                        
                                        }

                                    }
                                    if (strDeliveryDate != "") { 
                                    db.Update("Jmjm1",
                                      " DeliveryDateTime = '" + Modfunction.SQLSafe(strDeliveryDate) + "'",
                                      " JobNo='" + strJobNo + "'");
                                    }
                                }
                            }
                            Result = 1;
                        }
                    }
                }
            }
            catch { throw; }
            return Result;
        }



    }
}
