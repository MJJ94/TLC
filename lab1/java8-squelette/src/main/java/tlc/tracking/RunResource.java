package tlc.tracking;

import org.restlet.data.Form;
import org.restlet.data.Parameter;
import org.restlet.resource.Delete;
import org.restlet.resource.Get;
import org.restlet.resource.Post;
import org.restlet.resource.ServerResource;

public class RunResource extends ServerResource {

    @Post("json")
    public void bulkAdd(RecordList toAdd) {
        for(Record r : toAdd) System.out.println(r);
        //@FIXME You must add these Records in Google Datastore
    }

    @Get("json")
    public RecordList search() {
        // Read and print URL parameters
        Form form = getRequest().getResourceRef().getQueryAsForm();
        for (Parameter parameter : form) {
            System.out.print("parameter " + parameter.getName());
            System.out.println(" -> " + parameter.getValue());
        }

        // Build a dummy result
        RecordList res = new RecordList();
        res.add(new Record(5, 43.8, 12.6, "lea", 154789));
        res.add(new Record(5, 43.8, 12.6, "john", 154789));

        //@FIXME You must query Google Datastore to retrieve the records instead of sending dummy results
        //@FIXME Don't forget to apply potential filters got from the URL parameters

        return res;
    }

    @Delete("json")
    public void bulkDelete() {
        String[] run_ids = getRequest().getAttributes().get("list").toString().split(",");
        for (String r : run_ids) System.out.println("To delete: "+r);
        //@FIXME You must delete every records that contain one of the run_id in run_ids
    }

}