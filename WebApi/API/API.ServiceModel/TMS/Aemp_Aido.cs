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
    [Route("/tms/aemp1withaido1", "Get")]  //DriverCode=
    [Route("/tms/aemp1withaido1/update", "Post")] //
    [Route("/tms/aemp1withaido1/confirm", "Get")] //update?Key=,Remark=,TableName=

    public class Aemp_Aido : IReturn<CommonResponse>
    {
        public string Key { get; set; }
        public string Remark { get; set; }
        public string TableName { get; set; }
        public string UpdateAllString { get; set; }
        public string DriverCode { get; set; }
    }
    public class Aemp_Aido_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Aemp1_Aido1> Get_Aemp1WithAido1_List(Aemp_Aido request)
        {

            List<Aemp1_Aido1> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("TMS"))
                {
                    string strSql = "";
                    string strAemp1Where = "Where CONVERT(varchar(20),PickupDateTime ,112)=(select convert(varchar(10),getdate(),112))  and Driver1Code ='" + request.DriverCode + "'";
                    string strAido1Where = "Where  CONVERT(varchar(20),DeliveryDate ,112)=(select convert(varchar(10),getdate(),112))  and DriverCode ='" + request.DriverCode + "'";
                    strSql = "  select cast(TrxNo as varchar(20)) as 'Key','Aemp1' as TableName, 'Collect' as DCFlag ,'' as UpdatedFlag ,isnull((cast(pcs as nvarchar(20))+' ' +UomCode),'') as PcsUom ," +
                        "  PickupDateTime as TimeFrom  ,  CollectFromName as DeliveryToName, CollectFromAddress1 as DeliveryToAddress1 , " +
                        "  CollectFromAddress2 as DeliveryToAddress2 ,CollectFromAddress3 as DeliveryToAddress3 ,CollectFromAddress4 as DeliveryToAddress4 , " +
                        "  GrossWeight as Weight,Volume ,isnull(DeliveryInstruction1,'') as DeliveryInstruction1, isnull(DeliveryInstruction2,'') as DeliveryInstruction2, " +
                        "  isnull(DeliveryInstruction3, '') as DeliveryInstruction3,Remark as Remark,AttachmentFlag as AttachmentFlag ,isnull(JobNo,'') as JobNo,Case StatusCode When 'POD' then 'POD' Else (Case (Select Top 1 StatusCode from jmjm3 Where JobNo = Aemp1.JobNo Order By LineItemNo DESC) When 'CANCEL' then 'CANCEL' else Aemp1.StatusCode END) END AS StatusCode,'' AS CancelDescription  , " +
                        "  Driver1Code as  DriverCode , CONVERT(varchar(20),PickupDateTime ,112) as FilterTime , " +
                        "  isnull((select top 1 case isnull(Rcbp1.Handphone1, '') when '' then isnull(Rcbp1.Telephone, '')  else Rcbp1.Handphone1 end   from rcbp1 where rcbp1.BusinessPartyCode = aemp1.CollectFromCode ), '')  AS PhoneNumber" +
                        "  from Aemp1 " + strAemp1Where + "" +
                        "  UNION all " +
                        "  select DeliveryOrderNo as 'Key','Aido1' as TableName, 'Deliver' as DCFlag ,'' as UpdatedFlag ,isnull((cast(OriginalPcs as nvarchar(20)) + ' ' + OriginCode),'') as PcsUom , " +
                        "  DeliveryDate as TimeFrom  ,  DeliveryToName as DeliveryToName, DeliveryToAddress1 as DeliveryToAddress1 ,  " +
                        "  DeliveryToAddress2 as DeliveryToAddress2 ,DeliveryToAddress3 as DeliveryToAddress3 ,DeliveryToAddress4 as DeliveryToAddress4 , " +
                        "  Weight as Weight,0.0 as Volume ,isnull(DeliveryInstruction1,'') as DeliveryInstruction1, isnull(DeliveryInstruction2,'') as DeliveryInstruction2, " +
                        "  isnull(DeliveryInstruction3,'') as DeliveryInstruction3,Remark as Remark,AttachmentFlag as AttachmentFlag,isnull(JobNo,'') as JobNo,Case StatusCode When 'POD' then 'POD' Else (Select Top 1 StatusCode from jmjm3 Where JobNo = Aido1.JobNo Order By LineItemNo DESC) END AS StatusCode,'' AS CancelDescription  , " +
                        "  DriverCode as DriverCode , CONVERT(varchar(20),DeliveryDate ,112) as FilterTime , " +
                        "  isnull((select top 1 case isnull(Rcbp1.Handphone1, '') when '' then isnull(Rcbp1.Telephone, '')  else Rcbp1.Handphone1 end   from rcbp1 where rcbp1.BusinessPartyCode = aido1.DeliveryToCode ), '')  AS PhoneNumber" +
                        "  from Aido1   " + strAido1Where + "";
                    Result = db.Select<Aemp1_Aido1>(strSql);

                }
            }
            catch { throw; }
            return Result;

        }
        public int confirm_Aemp1WithAido1(Aemp_Aido request)
        {
            int Result = -1;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection())
                {
                    if (request.TableName == "Aemp1")
                    {
                        
                        db.Update(request.TableName,
                            " Remark = '" + request.Remark + "',StatusCode = 'POD',ActualPickUpDateTime=getdate()",
                            " TrxNo='" + request.Key + "'");
                    }
                    else
                    {
                        db.Update(request.TableName,
                           "  Remark = '" + request.Remark + "',StatusCode = 'POD',ActualDeliveryDateTime=getdate()",
                           "  DeliveryOrderNo='" + request.Key + "'");
                    }

                }

            }
            catch { throw; }
            return Result;
        }

        public int UpdateAll_Aemp1WithAido1(Aemp_Aido request)
        {
            int Result = -1;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection())
                {
                    if (request.UpdateAllString != null && request.UpdateAllString != "")
                    {
                        JArray ja = (JArray)JsonConvert.DeserializeObject(request.UpdateAllString);
                        if (ja != null)
                        {
                            for (int i = 0; i < ja.Count(); i++)
                            {
                                if (ja[i]["TableName"] == null || ja[i]["TableName"].ToString() == "")
                                { continue; }
                                string strKey= ja[i]["Key"].ToString();
                                string strTableName = ja[i]["TableName"].ToString();
                                string strRemark = "";
                                string strStatusCode = "";
                                if (  ja[i]["Remark"] != null || ja[i]["Remark"].ToString() != "")
                                    strRemark = ja[i]["Remark"].ToString();
                                if (ja[i]["StatusCode"] != null || ja[i]["StatusCode"].ToString() != "")
                                    strStatusCode = ja[i]["StatusCode"].ToString();
                                if (strStatusCode.ToLower() == "cancel")
                                {
                                    string strJobNo = "";
                                    if (ja[i]["JobNo"] != null || ja[i]["JobNo"].ToString() != "")
                                        strJobNo = ja[i]["JobNo"].ToString();
                                    if (strJobNo != "")
                                    {
                                        int intMaxLineItemNo = 1;
                                        List<Jmjm3> list1 = db.Select<Jmjm3>("Select Max(LineItemNo) LineItemNo from Jmjm3 Where JobNo = " + Modfunction.SQLSafeValue(strJobNo));
                                        if (list1 != null)
                                        {
                                            if ( list1[0].LineItemNo > 0)
                                                intMaxLineItemNo = list1[0].LineItemNo + 1;
                                        }
                                        db.Insert(new Jmjm3
                                        {
                                            JobNo = strJobNo,
                                            DateTime = DateTime.Now,
                                            UpdateDatetime = DateTime.Now,
                                            LineItemNo = intMaxLineItemNo,
                                            AutoFlag = "N",
                                            StatusCode = "CANCEL",
                                            UpdateBy = ja[0]["DriverCode"] == null ? "" : Modfunction.SQLSafe(ja[0]["DriverCode"].ToString()),
                                            Remark = Modfunction.SQLSafe(strRemark),
                                            Description = ja[0]["CancelDescription"] == null ? "" : Modfunction.SQLSafe(ja[0]["CancelDescription"].ToString())
                                        });
                                        if (strTableName == "Aemp1")
                                        {

                                            db.Update(strTableName,
                                              " Remark = '" + Modfunction.SQLSafe(strRemark) + "'",
                                              " TrxNo='" + strKey + "'");
                                        }
                                        else
                                        {
                                            db.Update(strTableName,
                                              " Remark = '" + Modfunction.SQLSafe(strRemark) + "'",
                                              " DeliveryOrderNo='" + strKey + "'");
                                        }

                                    }
                                }
                                else
                                {
                                    if (strTableName == "Aemp1")
                                    {

                                        db.Update(strTableName,
                                          " Remark = '" + Modfunction.SQLSafe(strRemark) + "',StatusCode = '" + strStatusCode + "'",
                                          " TrxNo='" + strKey + "'");
                                    }
                                    else
                                    {
                                        db.Update(strTableName,
                                          " Remark = '" + Modfunction.SQLSafe(strRemark) + "',StatusCode = '" + strStatusCode + "'",
                                          " DeliveryOrderNo='" + strKey + "'");
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
