namespace :backup do
  desc "This backs up the collection to gist"
  task :gist => :environment do
    raise "Must have gist token in `ENV['GIST_TOKEN']`" if !ENV['GIST_TOKEN']

    ### GET CSV
    csv_data = Item.to_csv
    csv_data = csv_data.encode("UTF-8", "ISO-8859-15")

    ### SAVE TO GIST
    gist_options = {
      access_token: ENV['GIST_TOKEN'],
      filename: "rayons_backup_#{Time.now.to_i}.csv",
      public: false
    }
    Jist.gist(csv_data, gist_options)
  end
end
